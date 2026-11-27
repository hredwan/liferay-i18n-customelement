#!/bin/sh
# Regenerates the priming fragment's key list, then zips the collection into
# the format expected by Fragments admin's Import option (Site Builder >
# Page Fragments > Import).
set -e

cd "$(dirname "$0")"

node generate-keys.js

cd i18n-priming-collection
mkdir -p ../dist
rm -f ../dist/i18n-priming-collection.zip
zip -r ../dist/i18n-priming-collection.zip . -x '.*'
echo "Wrote fragments/dist/i18n-priming-collection.zip"
