#!/usr/bin/env bash
# Prepara um VPS Ubuntu 24.04 (x86_64) limpo para o LeadBellus. Rode UMA vez, como root:
#   bash bootstrap.sh "ssh-ed25519 AAAA... leadbellus-deploy"
# O argumento é a chave PÚBLICA cuja privada vai no secret VPS_SSH_KEY do GitHub.
set -euo pipefail

DEPLOY_PUBKEY="${1:?passe a chave pública SSH de deploy como 1º argumento}"
APP_DIR=/opt/leadbellus

export DEBIAN_FRONTEND=noninteractive
# No 1º boot (user data da EC2) o unattended-upgrades pode estar com o lock do dpkg.
APT="apt-get -o DPkg::Lock::Timeout=600"
$APT update
$APT -y upgrade
$APT -y install docker.io docker-compose-v2 ufw unattended-upgrades curl
systemctl enable --now docker

# Firewall: só SSH e web.
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw --force enable

# Swap de 2 GB — folga para VPS pequeno.
if ! swapon --show | grep -q .; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Usuário com que o GitHub Actions entra para fazer deploy.
id deploy >/dev/null 2>&1 || useradd -m -s /bin/bash -G docker deploy
install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
touch /home/deploy/.ssh/authorized_keys
grep -qxF "$DEPLOY_PUBKEY" /home/deploy/.ssh/authorized_keys || echo "$DEPLOY_PUBKEY" >> /home/deploy/.ssh/authorized_keys
chown deploy:deploy /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys

install -d -m 750 -o deploy -g deploy "$APP_DIR"
[ -f "$APP_DIR/app.env" ] || install -m 600 -o deploy -g deploy /dev/null "$APP_DIR/app.env"

# Cron diário dos posts FB/IG (substitui o cron da vercel.json; 14:00 UTC —
# fuso padrão dos VPS). Sem CRON_SECRET no app.env a rota responde 503.
cat > /etc/cron.d/leadbellus <<'EOF'
0 14 * * * deploy curl -fsS -m 120 -H "Authorization: Bearer $(grep -E '^CRON_SECRET=' /opt/leadbellus/app.env | cut -d= -f2-)" http://127.0.0.1:8080/api/marketing/social-post >/dev/null 2>&1
EOF

echo "Pronto. Agora preencha $APP_DIR/app.env (modelo: deploy/vps/app.env.example) e rode o workflow 'Deploy VPS'."
