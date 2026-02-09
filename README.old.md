# Music Request App - Lidarr Integration

A web interface for searching MusicBrainz and managing music requests through Lidarr, similar to Overseerr but for music.

## Features

- 🔍 **Search MusicBrainz** for artists, albums, and releases
- ➕ **Add artists to Lidarr** with one click
- 📊 **Monitor wanted releases** and missing albums
- 📥 **View download queue** with progress and status
- ⚠️ **Track failed imports** and download errors
- ⚙️ **Easy configuration** via web interface

## Quick Start

### Option 1: Using Docker Compose (Recommended)

1. Create a directory for the app:
```bash
mkdir music-request && cd music-request
```

2. Download all files to this directory:
   - `Dockerfile`
   - `docker-compose.yml`
   - `index.html`
   - `music-request-app.jsx`
   - `nginx.conf`

3. Edit `docker-compose.yml` if needed:
   - Change port `3000:80` if port 3000 is already in use
   - Update the network name to match your Lidarr network
   - Set your timezone

4. Start the container:
```bash
docker-compose up -d
```

5. Access at `http://your-server-ip:3000`

### Option 2: Add to Existing Docker Compose Stack

Add this to your existing `docker-compose.yml`:

```yaml
  music-request:
    build: ./music-request  # Path to the directory with the Dockerfile
    container_name: music-request
    ports:
      - "3000:80"
    restart: unless-stopped
    networks:
      - media  # Same network as Lidarr
    environment:
      - TZ=America/New_York
```

## Configuration

1. **Open the app** in your browser (http://your-server-ip:3000)

2. **Go to Settings** and configure:
   - **Lidarr URL**: Your Lidarr address (e.g., `http://lidarr:8686` or `http://192.168.1.100:8686`)
   - **API Key**: Found in Lidarr → Settings → General → Security

3. **Save settings** - they'll persist in your browser's localStorage

## Usage

### Searching for Music
1. Go to the **Search** page
2. Select search type (Artists, Albums, or Releases)
3. Enter your search query
4. Click on "Add to Lidarr" for any result

### Monitoring Status
1. Go to the **Status** page
2. View **Wanted Releases** - albums Lidarr is looking for
3. View **Download Queue** - active downloads with:
   - Progress bars
   - Status indicators (downloading, completed, error, warning)
   - Error messages for failed imports

## Network Configuration

The app needs to communicate with:
- **MusicBrainz API** (external, port 443)
- **Your Lidarr instance** (internal network)

If Lidarr and music-request are on the same Docker network, you can use the container name as the hostname (e.g., `http://lidarr:8686`).

## Troubleshooting

### Can't connect to Lidarr
- Make sure both containers are on the same Docker network
- Verify the Lidarr URL is correct (include http://)
- Check that the API key is correct
- Try using IP address instead of hostname

### CORS errors
- If you see CORS errors, make sure you're accessing Lidarr from the same network
- Use the container hostname if on the same Docker network

### Port conflicts
- Change the external port in docker-compose.yml (e.g., `8080:80` instead of `3000:80`)

## Building from Source

```bash
docker build -t music-request .
docker run -d -p 3000:80 --name music-request music-request
```

## Environment Variables

Currently, all configuration is done through the web UI. The app stores:
- Lidarr URL
- Lidarr API Key

These are saved to browser localStorage, so each browser/device needs to be configured separately.

## Future Enhancements

Potential features to add:
- User authentication and permissions
- Request approval workflow
- Multiple quality profile support
- Album-specific requests (not just artists)
- Notification system
- Request history
- Mobile-responsive improvements

## License

MIT License - feel free to modify and use as needed!
