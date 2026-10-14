#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// ----------------------------------------------------------------------------
// Persistent Storage Paths (Protected from git pulls and container re-deploys)
// ----------------------------------------------------------------------------
const dataDir = process.env.DATA_DIR || path.join(projectRoot, 'storage', 'data');
const uploadsDir = process.env.UPLOADS_DIR || path.join(projectRoot, 'storage', 'uploads');

// Ensure storage directories exist
fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });

const playlistPath = path.join(dataDir, 'playlist.json');
const communityFile = path.join(dataDir, 'community-requests.json');
const defaultSeedPlaylist = path.join(projectRoot, 'src', 'data', 'playlist.json');

// Initialize persistent playlist.json if not present
if (!fs.existsSync(playlistPath)) {
  if (fs.existsSync(defaultSeedPlaylist)) {
    try {
      fs.copyFileSync(defaultSeedPlaylist, playlistPath);
      console.log('Seeded persistent playlist.json from default template.');
    } catch {
      fs.writeFileSync(playlistPath, JSON.stringify({ tracks: [] }, null, 2), 'utf-8');
    }
  } else {
    fs.writeFileSync(playlistPath, JSON.stringify({ tracks: [] }, null, 2), 'utf-8');
  }
}

// Initialize persistent community-requests.json if not present
if (!fs.existsSync(communityFile)) {
  fs.writeFileSync(communityFile, '[]', 'utf-8');
}

// Helper to safely read persistent playlist.json
function readPlaylist() {
  if (!fs.existsSync(playlistPath)) {
    return { curator: 'VibeDesk SoundLab', version: '2.5.0', tracks: [] };
  }
  try {
    const raw = fs.readFileSync(playlistPath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading playlist.json:', err);
    return { curator: 'VibeDesk SoundLab', version: '2.5.0', tracks: [] };
  }
}

// Helper to safely write persistent playlist.json
function writePlaylist(data) {
  data.updatedAt = new Date().toISOString().split('T')[0];
  fs.writeFileSync(playlistPath, JSON.stringify(data, null, 2), 'utf-8');
}

// Helper for emotion requests
function readEmotionRequests() {
  if (!fs.existsSync(communityFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(communityFile, 'utf-8'));
  } catch {
    return [];
  }
}

function writeEmotionRequests(data) {
  fs.writeFileSync(communityFile, JSON.stringify(data, null, 2), 'utf-8');
}

// ----------------------------------------------------------------------------
// Multer Configuration for Audio & Cover Uploads
// ----------------------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanExt = ext || (file.mimetype.includes('audio') ? '.mp3' : '.jpg');
    const prefix = file.fieldname === 'audio' ? 'audio' : 'cover';
    const uniqueName = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${cleanExt}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max per file
});

// ----------------------------------------------------------------------------
// MCP Server Factory
// ----------------------------------------------------------------------------
function createMcpServer() {
  const server = new Server(
    {
      name: 'vibedesk-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register Available Tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'vibedesk_list_tracks',
          description: 'Get all songs currently configured in persistent VibeDesk Music playlist with metadata.',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'vibedesk_add_track',
          description: 'Add a new track into persistent VibeDesk Music playlist with audio URL, cover image, lyrics, and metadata.',
          inputSchema: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Title of the song' },
              artist: { type: 'string', description: 'Artist or creator name' },
              album: { type: 'string', description: 'Album name (optional)' },
              duration: { type: 'number', description: 'Duration in seconds (e.g. 195)' },
              genre: {
                type: 'string',
                description: 'Genre (e.g. Lofi & Chill, Cyber Synth, Piano & Acoustic, Deep Focus)',
              },
              audioUrl: { type: 'string', description: 'Direct HTTP/HTTPS link to MP3/audio file' },
              cover: { type: 'string', description: 'Direct image URL for track album cover' },
              accentColor: { type: 'string', description: 'Hex color code for glow effect (e.g. #8b5cf6, #06b6d4, #ec4899)' },
              lyrics: { type: 'string', description: 'Lyrics or poetic thoughts to display on Vinyl sleeve' },
              featured: { type: 'boolean', description: 'Whether to highlight track on homepage' },
            },
            required: ['title', 'artist', 'audioUrl'],
          },
        },
        {
          name: 'vibedesk_update_track',
          description: 'Update metadata, audio URL, or cover image of an existing track in VibeDesk Music.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Unique track ID (e.g. trk-01)' },
              title: { type: 'string' },
              artist: { type: 'string' },
              album: { type: 'string' },
              duration: { type: 'number' },
              genre: { type: 'string' },
              audioUrl: { type: 'string' },
              cover: { type: 'string' },
              accentColor: { type: 'string' },
              lyrics: { type: 'string' },
              featured: { type: 'boolean' },
            },
            required: ['id'],
          },
        },
        {
          name: 'vibedesk_delete_track',
          description: 'Delete a track from persistent VibeDesk Music playlist by ID.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'ID of track to delete (e.g. trk-02)' },
            },
            required: ['id'],
          },
        },
        {
          name: 'vibedesk_batch_import',
          description: 'Batch import an array of track objects into persistent VibeDesk Music playlist.',
          inputSchema: {
            type: 'object',
            properties: {
              tracks: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    artist: { type: 'string' },
                    album: { type: 'string' },
                    duration: { type: 'number' },
                    genre: { type: 'string' },
                    audioUrl: { type: 'string' },
                    cover: { type: 'string' },
                    accentColor: { type: 'string' },
                    lyrics: { type: 'string' },
                    featured: { type: 'boolean' },
                  },
                  required: ['title', 'artist', 'audioUrl'],
                },
              },
            },
            required: ['tracks'],
          },
        },
        {
          name: 'vibedesk_git_sync',
          description: 'Sync persistent playlist to git repo and push to GitHub repository main branch.',
          inputSchema: {
            type: 'object',
            properties: {
              commitMessage: {
                type: 'string',
                description: 'Custom commit message (optional)',
              },
            },
          },
        },
        {
          name: 'vibedesk_get_emotion_requests',
          description: 'Retrieve community emotion, story, and AI music requests submitted by listeners to inspire AI music generation.',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    };
  });

  // Tool Execution Dispatcher
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'vibedesk_list_tracks': {
          const playlist = readPlaylist();
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(playlist, null, 2),
              },
            ],
          };
        }

        case 'vibedesk_add_track': {
          const playlist = readPlaylist();
          const newId = `trk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          const newTrack = {
            id: newId,
            title: args.title,
            artist: args.artist,
            album: args.album || 'Single',
            duration: args.duration || 180,
            genre: args.genre || 'Lofi & Chill',
            audioUrl: args.audioUrl,
            cover:
              args.cover ||
              'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
            accentColor: args.accentColor || '#8b5cf6',
            lyrics: args.lyrics || '',
            featured: Boolean(args.featured),
          };

          playlist.tracks.unshift(newTrack);
          writePlaylist(playlist);

          return {
            content: [
              {
                type: 'text',
                text: `Track "${newTrack.title}" added successfully with ID: ${newId}. Total tracks: ${playlist.tracks.length}`,
              },
            ],
          };
        }

        case 'vibedesk_update_track': {
          const playlist = readPlaylist();
          const trackIndex = playlist.tracks.findIndex((t) => t.id === args.id);

          if (trackIndex === -1) {
            throw new Error(`Track with ID "${args.id}" not found.`);
          }

          const existing = playlist.tracks[trackIndex];
          playlist.tracks[trackIndex] = {
            ...existing,
            ...(args.title && { title: args.title }),
            ...(args.artist && { artist: args.artist }),
            ...(args.album !== undefined && { album: args.album }),
            ...(args.duration && { duration: args.duration }),
            ...(args.genre && { genre: args.genre }),
            ...(args.audioUrl && { audioUrl: args.audioUrl }),
            ...(args.cover && { cover: args.cover }),
            ...(args.accentColor && { accentColor: args.accentColor }),
            ...(args.lyrics !== undefined && { lyrics: args.lyrics }),
            ...(args.featured !== undefined && { featured: args.featured }),
          };

          writePlaylist(playlist);

          return {
            content: [
              {
                type: 'text',
                text: `Track "${playlist.tracks[trackIndex].title}" (ID: ${args.id}) updated successfully.`,
              },
            ],
          };
        }

        case 'vibedesk_delete_track': {
          const playlist = readPlaylist();
          const initialLen = playlist.tracks.length;
          const trackToDelete = playlist.tracks.find((t) => t.id === args.id);
          playlist.tracks = playlist.tracks.filter((t) => t.id !== args.id);

          if (playlist.tracks.length === initialLen) {
            throw new Error(`Track with ID "${args.id}" not found in playlist.`);
          }

          // Clean up physical file if it was uploaded to /uploads/
          if (trackToDelete?.audioUrl?.startsWith('/uploads/')) {
            const p = path.join(uploadsDir, path.basename(trackToDelete.audioUrl));
            if (fs.existsSync(p)) {
              try { fs.unlinkSync(p); } catch {}
            }
          }
          if (trackToDelete?.cover?.startsWith('/uploads/')) {
            const p = path.join(uploadsDir, path.basename(trackToDelete.cover));
            if (fs.existsSync(p)) {
              try { fs.unlinkSync(p); } catch {}
            }
          }

          writePlaylist(playlist);

          return {
            content: [
              {
                type: 'text',
                text: `Track ID "${args.id}" deleted successfully. Remaining tracks: ${playlist.tracks.length}`,
              },
            ],
          };
        }

        case 'vibedesk_batch_import': {
          const playlist = readPlaylist();
          let imported = 0;

          for (const item of args.tracks) {
            const newId = `trk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
            playlist.tracks.unshift({
              id: newId,
              title: item.title,
              artist: item.artist,
              album: item.album || 'Single',
              duration: item.duration || 180,
              genre: item.genre || 'Lofi & Chill',
              audioUrl: item.audioUrl,
              cover:
                item.cover ||
                'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
              accentColor: item.accentColor || '#8b5cf6',
              lyrics: item.lyrics || '',
              featured: Boolean(item.featured),
            });
            imported++;
          }

          writePlaylist(playlist);

          return {
            content: [
              {
                type: 'text',
                text: `Batch imported ${imported} tracks successfully. Total tracks: ${playlist.tracks.length}`,
              },
            ],
          };
        }

        case 'vibedesk_git_sync': {
          const commitMsg =
            args.commitMessage ||
            `chore(music): update playlist tracks via VibeDesk AI MCP [${new Date().toISOString()}]`;

          try {
            // Copy persistent playlist back to src/data/playlist.json for repo backup
            if (fs.existsSync(playlistPath)) {
              fs.copyFileSync(playlistPath, defaultSeedPlaylist);
            }
            execSync(`git add "${defaultSeedPlaylist}"`, { cwd: projectRoot });
            execSync(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`, {
              cwd: projectRoot,
            });
            execSync('git push origin main', { cwd: projectRoot });

            return {
              content: [
                {
                  type: 'text',
                  text: `Successfully committed and pushed playlist.json to GitHub main branch.\nMessage: "${commitMsg}"`,
                },
              ],
            };
          } catch (gitErr) {
            throw new Error(`Git sync failed: ${gitErr.message}`);
          }
        }

        case 'vibedesk_get_emotion_requests': {
          const requests = readEmotionRequests();
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    total: requests.length,
                    requests,
                    note: 'Listener submissions received directly from VibeDesk Music web client.',
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (err) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Error executing ${name}: ${err.message}`,
          },
        ],
      };
    }
  });

  return server;
}

// ----------------------------------------------------------------------------
// Runtime Bootstrapping: Dual-Mode (Stdio or HTTP/SSE Web Server)
// ----------------------------------------------------------------------------
const isStdioMode = process.argv.includes('--stdio') || process.env.MCP_TRANSPORT === 'stdio';

if (isStdioMode) {
  // Stdio Mode for local CLI tool execution
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  server.connect(transport).then(() => {
    console.error('VibeDesk MCP Server running on stdio');
  }).catch((err) => {
    console.error('Fatal error starting Stdio MCP server:', err);
    process.exit(1);
  });
} else {
  // HTTP/SSE Web Server Mode
  const app = express();
  const PORT = process.env.PORT || 3004;

  app.use(cors());

  // Static files server for user uploaded audio & covers
  app.use('/uploads', express.static(uploadsDir, {
    maxAge: '30d',
    immutable: true,
  }));

  // Store active SSE transports by sessionId
  const sseTransports = new Map();

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'vibedesk-api-mcp',
      time: new Date().toISOString(),
      storage: {
        dataDir,
        uploadsDir,
        playlistExists: fs.existsSync(playlistPath),
      },
      mcpEndpoints: {
        sse: '/mcp/sse',
        messages: '/mcp/messages',
      },
    });
  });

  // REST API: Upload Audio & Cover Files
  app.post(
    '/api/upload',
    upload.fields([
      { name: 'audio', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
    ]),
    (req, res) => {
      try {
        const result = {};
        if (req.files?.audio?.[0]) {
          result.audioUrl = `/uploads/${req.files.audio[0].filename}`;
          result.audioOriginalName = req.files.audio[0].originalname;
          result.audioSize = req.files.audio[0].size;
        }
        if (req.files?.cover?.[0]) {
          result.coverUrl = `/uploads/${req.files.cover[0].filename}`;
          result.coverOriginalName = req.files.cover[0].originalname;
        }
        res.json(result);
      } catch (err) {
        console.error('Upload processing error:', err);
        res.status(500).json({ error: err.message });
      }
    }
  );

  // REST API: Get persistent playlist
  app.get('/api/playlist', (req, res) => {
    try {
      res.json(readPlaylist());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // REST API: Add track to persistent playlist
  app.post('/api/tracks', express.json(), (req, res) => {
    try {
      const playlist = readPlaylist();
      const newId = req.body.id || `trk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newTrack = {
        id: newId,
        title: req.body.title || 'Untitled',
        artist: req.body.artist || 'Unknown Artist',
        album: req.body.album || 'Single',
        duration: Number(req.body.duration) || 180,
        genre: req.body.genre || 'Lofi & Chill',
        audioUrl: req.body.audioUrl,
        cover:
          req.body.cover ||
          'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
        accentColor: req.body.accentColor || '#8b5cf6',
        lyrics: req.body.lyrics || '',
        featured: Boolean(req.body.featured),
        createdAt: new Date().toISOString(),
      };

      // Add to top of tracks
      playlist.tracks.unshift(newTrack);
      writePlaylist(playlist);
      console.log(`[API] Added track "${newTrack.title}" (${newId}) to persistent playlist.`);
      res.status(201).json(newTrack);
    } catch (err) {
      console.error('[API] Add track error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // REST API: Delete track from persistent playlist
  app.delete('/api/tracks/:id', (req, res) => {
    try {
      const playlist = readPlaylist();
      const trackId = req.params.id;
      const trackToDelete = playlist.tracks.find((t) => t.id === trackId);

      if (!trackToDelete) {
        return res.status(404).json({ error: `Track with ID "${trackId}" not found.` });
      }

      // Clean up physical file if it was uploaded to /uploads/
      if (trackToDelete.audioUrl?.startsWith('/uploads/')) {
        const p = path.join(uploadsDir, path.basename(trackToDelete.audioUrl));
        if (fs.existsSync(p)) {
          try { fs.unlinkSync(p); } catch {}
        }
      }
      if (trackToDelete.cover?.startsWith('/uploads/')) {
        const p = path.join(uploadsDir, path.basename(trackToDelete.cover));
        if (fs.existsSync(p)) {
          try { fs.unlinkSync(p); } catch {}
        }
      }

      playlist.tracks = playlist.tracks.filter((t) => t.id !== trackId);
      writePlaylist(playlist);
      console.log(`[API] Deleted track "${trackToDelete.title}" (${trackId}) from persistent playlist.`);
      res.json({ success: true, id: trackId, remaining: playlist.tracks.length });
    } catch (err) {
      console.error('[API] Delete track error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // REST API: Reset playlist to default seed template
  app.post('/api/tracks/reset', (req, res) => {
    try {
      if (fs.existsSync(defaultSeedPlaylist)) {
        const raw = fs.readFileSync(defaultSeedPlaylist, 'utf-8');
        const seedData = JSON.parse(raw);
        writePlaylist(seedData);
        console.log('[API] Reset persistent playlist to default seed template.');
        res.json({ success: true, message: 'Reset to default seed playlist', tracks: seedData.tracks });
      } else {
        res.status(404).json({ error: 'Default seed playlist not found' });
      }
    } catch (err) {
      console.error('[API] Reset error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // REST API: Get listener emotion requests
  app.get('/api/emotion-requests', (req, res) => {
    try {
      res.json(readEmotionRequests());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // REST API: Submit listener emotion request
  app.post('/api/emotion-requests', express.json(), (req, res) => {
    try {
      const requests = readEmotionRequests();
      const newReq = {
        id: `req-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        status: 'new',
        ...req.body,
      };
      requests.unshift(newReq);
      // Keep up to 500 recent requests
      if (requests.length > 500) requests.length = 500;
      writeEmotionRequests(requests);
      res.status(201).json(newReq);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // MCP SSE Connection Endpoint
  app.get('/mcp/sse', async (req, res) => {
    try {
      const server = createMcpServer();
      const transport = new SSEServerTransport('/mcp/messages', res);
      sseTransports.set(transport.sessionId, transport);

      transport.onclose = () => {
        sseTransports.delete(transport.sessionId);
      };

      await server.connect(transport);
    } catch (err) {
      console.error('Error establishing MCP SSE connection:', err);
      if (!res.headersSent) {
        res.status(500).send('Error establishing MCP SSE stream');
      }
    }
  });

  // MCP Message Endpoint (POST)
  app.post('/mcp/messages', async (req, res) => {
    const sessionId = req.query.sessionId;
    if (!sessionId) {
      res.status(400).send('Missing sessionId parameter');
      return;
    }

    const transport = sseTransports.get(sessionId);
    if (!transport) {
      res.status(404).send('SSE Session not found');
      return;
    }

    try {
      await transport.handlePostMessage(req, res);
    } catch (err) {
      console.error('Error handling MCP post message:', err);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 VibeDesk API & MCP Web Server listening on port ${PORT}`);
    console.log(`   - Data Directory:    ${dataDir}`);
    console.log(`   - Uploads Directory: ${uploadsDir}`);
    console.log(`   - MCP SSE Endpoint:  http://localhost:${PORT}/mcp/sse`);
    console.log(`   - REST API:          http://localhost:${PORT}/api/playlist`);
  });
}
