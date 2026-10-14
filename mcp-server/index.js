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
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const playlistPath = path.join(projectRoot, 'src', 'data', 'playlist.json');
const communityFile = path.join(projectRoot, 'src', 'data', 'community-requests.json');

// Helper to safely read playlist.json
function readPlaylist() {
  if (!fs.existsSync(playlistPath)) {
    throw new Error(`playlist.json not found at: ${playlistPath}`);
  }
  const raw = fs.readFileSync(playlistPath, 'utf-8');
  return JSON.parse(raw);
}

// Helper to safely write playlist.json
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

// Create configured MCP Server instance
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
          description: 'Get all songs currently configured in VibeDesk Music playlist with metadata.',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'vibedesk_add_track',
          description: 'Add a new track into VibeDesk Music playlist with audio URL, cover image, lyrics, and metadata.',
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
          description: 'Delete a track from VibeDesk Music playlist by ID.',
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
          description: 'Batch import an array of track objects into VibeDesk Music playlist.',
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
          description: 'Automatically commit updated playlist.json and push to GitHub repository main branch to trigger auto-deployment.',
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

          playlist.tracks.push(newTrack);
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
          playlist.tracks = playlist.tracks.filter((t) => t.id !== args.id);

          if (playlist.tracks.length === initialLen) {
            throw new Error(`Track with ID "${args.id}" not found in playlist.`);
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
            playlist.tracks.push({
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
            execSync(`git add "${playlistPath}"`, { cwd: projectRoot });
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

  // Store active SSE transports by sessionId
  const sseTransports = new Map();

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'vibedesk-api-mcp',
      time: new Date().toISOString(),
      mcpEndpoints: {
        sse: '/mcp/sse',
        messages: '/mcp/messages',
      },
    });
  });

  // REST API: Get playlist
  app.get('/api/playlist', (req, res) => {
    try {
      res.json(readPlaylist());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // REST API: Add track
  app.post('/api/tracks', express.json(), (req, res) => {
    try {
      const playlist = readPlaylist();
      const newId = `trk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newTrack = {
        id: newId,
        ...req.body,
      };
      playlist.tracks.push(newTrack);
      writePlaylist(playlist);
      res.status(201).json(newTrack);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // REST API: Delete track
  app.delete('/api/tracks/:id', (req, res) => {
    try {
      const playlist = readPlaylist();
      playlist.tracks = playlist.tracks.filter((t) => t.id !== req.params.id);
      writePlaylist(playlist);
      res.json({ success: true, id: req.params.id });
    } catch (err) {
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
      // Keep up to 200 recent requests
      if (requests.length > 200) requests.length = 200;
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
    console.log(`   - MCP SSE Endpoint: http://localhost:${PORT}/mcp/sse`);
    console.log(`   - REST API:         http://localhost:${PORT}/api/playlist`);
  });
}
