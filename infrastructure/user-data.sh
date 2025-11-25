#!/bin/bash
set -e
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

# Install nvm for ec2-user
su - ec2-user -c 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash'

# Install Node.js LTS for ec2-user
su - ec2-user -c 'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm install --lts && nvm use --lts && node -v'

# Install pnpm for ec2-user
su - ec2-user -c 'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && npm install -g pnpm@latest-10'

# Create application directory
mkdir -p /home/ec2-user/app
chown ec2-user:ec2-user /home/ec2-user/app

# Install and configure Caddy from official GitHub release (linux_arm64)
sudo dnf install -y tar wget
ARCHIVE_URL=$(
  curl -s https://api.github.com/repos/caddyserver/caddy/releases/latest \
  | grep 'browser_download_url' \
  | grep 'linux_arm64.tar.gz' \
  | grep -v '.sig' \
  | cut -d '"' -f 4
)
echo "Downloading: $ARCHIVE_URL"
wget "$ARCHIVE_URL"
ARCHIVE_FILE=$(basename "$ARCHIVE_URL")
tar -xzf "$ARCHIVE_FILE" caddy
sudo install -m 0755 caddy /usr/local/bin/caddy
sudo setcap cap_net_bind_service=+ep /usr/local/bin/caddy
caddy version

# Create Caddyfile
sudo mkdir -p /etc/caddy
sudo tee /etc/caddy/Caddyfile >/dev/null <<'CADDYEOF'
w3s.pkx.to {
    reverse_proxy localhost:3000
}
CADDYEOF

# Create Caddy systemd service
sudo tee /etc/systemd/system/caddy.service >/dev/null <<'CADDYSERVEOF'
[Unit]
Description=Caddy Web Server
After=network-online.target
Wants=network-online.target

[Service]
User=ec2-user
Group=ec2-user
Type=notify
WorkingDirectory=/home/ec2-user
ExecStart=/usr/local/bin/caddy run --environ --config /etc/caddy/Caddyfile
ExecReload=/usr/local/bin/caddy reload --config /etc/caddy/Caddyfile --force
Restart=on-abnormal
LimitNOFILE=1048576

[Install]
WantedBy=multi-user.target
CADDYSERVEOF

# Reload systemd and enable Caddy
systemctl daemon-reload
systemctl enable --now caddy

# Create systemd service for robo
sudo tee /etc/systemd/system/robo.service >/dev/null <<'SERVICEEOF'
[Unit]
Description=Robo.js Application Server
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/app
Environment=NODE_ENV=production
ExecStart=/bin/bash -c 'source /home/ec2-user/.nvm/nvm.sh && cd /home/ec2-user/app && pnpm start'
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
SERVICEEOF

# Reload systemd and enable robo service (don't start yet, app needs to be deployed first)
systemctl daemon-reload
systemctl enable robo

