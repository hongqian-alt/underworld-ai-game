#!/bin/bash
# 部署《我在地府搞AI》游戏到 Vercel 生产环境
# 用法：./deploy.sh
# 前置：Vercel token 存在 .vercel-token（一行，被 .gitignore 忽略，不提交）

set -e
cd "$(dirname "$0")"

TOKEN_FILE=".vercel-token"
if [ ! -f "$TOKEN_FILE" ]; then
  echo "错误：缺少 $TOKEN_FILE 文件。"
  echo "请创建它并写入你的 Vercel token（一行）："
  echo '  echo "你的token" > .vercel-token'
  exit 1
fi
VERCEL_TOKEN="$(cat "$TOKEN_FILE")"

echo "① 构建（tsc 检查 + vite 打包）..."
npm run build

echo "② 部署到 Vercel 生产环境..."
npx vercel deploy dist --prod --token "$VERCEL_TOKEN"

echo ""
echo "部署完成。手机访问线上链接即可试玩。"