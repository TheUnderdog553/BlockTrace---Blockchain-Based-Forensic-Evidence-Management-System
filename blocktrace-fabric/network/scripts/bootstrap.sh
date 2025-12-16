#!/usr/bin/env bash
set -euo pipefail

NETWORK_DIR=$(cd "$(dirname "$0")/.." && pwd)
CRYPTO_DIR="$NETWORK_DIR/crypto-config"
CONFIGTX_DIR="$NETWORK_DIR/configtx"

function generate() {
  echo "Generating crypto material..."
  cryptogen generate --config=$CRYPTO_DIR/crypto-config.yaml --output=$CRYPTO_DIR

  echo "Generating genesis block + channel artifacts..."
  configtxgen -profile BlockTraceGenesis -channelID system-channel -outputBlock $CONFIGTX_DIR/genesis.block
  configtxgen -profile BlockTraceChannel -outputCreateChannelTx $CONFIGTX_DIR/blocktrace-channel.tx -channelID blocktrace-channel
}

function up() {
  docker compose -f $NETWORK_DIR/docker-compose.yaml up -d
}

function down() {
  docker compose -f $NETWORK_DIR/docker-compose.yaml down -v
}

case "${1:-}" in
  generate) generate ;;
  up) up ;;
  down) down ;;
  *)
    echo "Usage: $0 {generate|up|down}"
    exit 64
    ;;
esac
