#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const playlistPath = path.join(projectRoot, 'src', 'data', 'playlist.json');

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

// Initialize MCP Server
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
              text: JSON.stringify(
                {
                  total: playlist.tracks?.length || 0,
                  updatedAt: playlist.updatedAt,
                  tracks: playlist.tracks,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'vibedesk_add_track': {
        const playlist = readPlaylist();
        const newId = `trk-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
        
        const newTrack = {
          id: newId,
          title: args.title,
          artist: args.artist,
          album: args.album || args.title,
          duration: args.duration || 180,
          genre: args.genre || 'Lofi & Chill',
          accentColor: args.accentColor || '#8b5cf6',
          cover:
            args.cover ||
            'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
          audioUrl: args.audioUrl,
          lyrics: args.lyrics || 'Music speaks when words fail...',
          featured: Boolean(args.featured),
        };

        // Add category if not present
        if (newTrack.genre && !playlist.categories.includes(newTrack.genre)) {
          playlist.categories.push(newTrack.genre);
        }

        playlist.tracks.push(newTrack);
        writePlaylist(playlist);

        return {
          content: [
            {
              type: 'text',
              text: `Successfully added track "${newTrack.title}" by ${newTrack.artist} (ID: ${newId}). Total tracks: ${playlist.tracks.length}.`,
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

        const currentTrack = playlist.tracks[trackIndex];
        const updatedTrack = {
          ...currentTrack,
          ...(args.title && { title: args.title }),
          ...(args.artist && { artist: args.artist }),
          ...(args.album && { album: args.album }),
          ...(args.duration !== undefined && { duration: args.duration }),
          ...(args.genre && { genre: args.genre }),
          ...(args.audioUrl && { audioUrl: args.audioUrl }),
          ...(args.cover && { cover: args.cover }),
          ...(args.accentColor && { accentColor: args.accentColor }),
          ...(args.lyrics !== undefined && { lyrics: args.lyrics }),
          ...(args.featured !== undefined && { featured: args.featured }),
        };

        if (updatedTrack.genre && !playlist.categories.includes(updatedTrack.genre)) {
          playlist.categories.push(updatedTrack.genre);
        }

        playlist.tracks[trackIndex] = updatedTrack;
        writePlaylist(playlist);

        return {
          content: [
            {
              type: 'text',
              text: `Successfully updated track "${updatedTrack.title}" (${args.id}).`,
            },
          ],
        };
      }

      case 'vibedesk_delete_track': {
        const playlist = readPlaylist();
        const initialCount = playlist.tracks.length;
        playlist.tracks = playlist.tracks.filter((t) => t.id !== args.id);

        if (playlist.tracks.length === initialCount) {
          throw new Error(`Track with ID "${args.id}" not found.`);
        }

        writePlaylist(playlist);
        return {
          content: [
            {
              type: 'text',
              text: `Successfully deleted track "${args.id}". Remaining tracks: ${playlist.tracks.length}.`,
            },
          ],
        };
      }

      case 'vibedesk_batch_import': {
        const playlist = readPlaylist();
        const newTracks = args.tracks || [];
        let addedCount = 0;

        for (const t of newTracks) {
          const trackId = `trk-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
          const trackItem = {
            id: trackId,
            title: t.title,
            artist: t.artist,
            album: t.album || t.title,
            duration: t.duration || 180,
            genre: t.genre || 'Lofi & Chill',
            accentColor: t.accentColor || '#8b5cf6',
            cover:
              t.cover ||
              'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
            audioUrl: t.audioUrl,
            lyrics: t.lyrics || 'Music speaks when words fail...',
            featured: Boolean(t.featured),
          };

          if (trackItem.genre && !playlist.categories.includes(trackItem.genre)) {
            playlist.categories.push(trackItem.genre);
          }

          playlist.tracks.push(trackItem);
          addedCount++;
        }

        writePlaylist(playlist);

        return {
          content: [
            {
              type: 'text',
              text: `Successfully imported ${addedCount} tracks. Total tracks in VibeDesk: ${playlist.tracks.length}.`,
            },
          ],
        };
      }

      case 'vibedesk_git_sync': {
        const commitMsg =
          args.commitMessage ||
          `feat(content): update playlist configuration via AI MCP [${new Date().toISOString()}]`;

        const gitCmd = `git add src/data/playlist.json && git commit -m "${commitMsg}" && git push origin main`;
        const output = execSync(gitCmd, { cwd: projectRoot, encoding: 'utf-8' });

        return {
          content: [
            {
              type: 'text',
              text: `Git Auto-Sync succeeded!\n\n${output}\nDeployment triggered on remote repository.`,
            },
          ],
        };
      }

      case 'vibedesk_get_emotion_requests': {
        const communityFile = path.join(projectRoot, 'src', 'data', 'emotion_requests.json');
        let requests = [];
        if (fs.existsSync(communityFile)) {
          try {
            requests = JSON.parse(fs.readFileSync(communityFile, 'utf-8'));
          } catch {
            requests = [];
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  totalInFile: requests.length,
                  requests,
                  note: 'Client-side submissions are stored in browser LocalStorage (vibedesk_emotion_requests) and visible in Admin Studio tab "Gợi Ý Cảm Xúc".',
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

// Start Server on Stdio
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('VibeDesk MCP Server running on stdio');
}

run().catch((error) => {
  console.error('Fatal error running VibeDesk MCP Server:', error);
  process.exit(1);
});
