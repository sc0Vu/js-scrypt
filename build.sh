OPENSSL_DIR=$PWD/openssl
SCRYPT_DIR=$PWD/scrypt

uname_os() {
  os=$(uname -s | tr '[:upper:]' '[:lower:]')
  case $os in
    msys*) os="windows" ;;
    mingw*) os="windows" ;;
  esac
  echo "${os}"
}

# build openssl
# test pass on macos
cd $OPENSSL_DIR
emconfigure ./config no-asm
OS=$(uname_os)
sed -i '' -e 's|^CROSS_COMPILE.*$|CROSS_COMPILE=|g' Makefile
if [ "$OS" = "darwin" ]; then
    sed -i '' -e 's|^CNF_CFLAGS.*$|CNF_CFLAGS=|g' Makefile
    sed -i '' -e 's|,-search_paths_first$||g' Makefile
fi
emmake make -j 12 build_generated libssl.a libcrypto.a

# build scrypt
cd $SCRYPT_DIR
autoreconf -if --warnings=all
emconfigure ./configure --enable-libscrypt-kdf --disable-shared --disable-largefile CPPFLAGS="-I../openssl/include" LDFLAGS="-L../openssl"
emmake make

EMCC_OPTIONS=(
    -O3
    -s MODULARIZE=1
    -s EXPORT_NAME="'SCRYPT'"
    -s ALLOW_MEMORY_GROWTH=1
    -s INVOKE_RUN=1
    -s ERROR_ON_UNDEFINED_SYMBOLS=0
    -s NO_EXIT_RUNTIME=1
    -s NO_DYNAMIC_EXECUTION=1
    -s STRICT=1
)

EMCC_WEB_OPTIONS=(
    # -s ENVIRONMENT=web
    -s NO_FILESYSTEM=1
)

EMCC_SCRYPT_OPTIONS=(
    -s LINKABLE=1
    -s EXPORTED_FUNCTIONS='["_crypto_scrypt", "_malloc", "_free"]'
    -s EXPORTED_RUNTIME_METHODS='["getValue"]'
)

EMCC_WASM_OPTIONS=(
    -s WASM=1
    -s BINARYEN_IGNORE_IMPLICIT_TRAPS=1
    -mnontrapping-fptoint
)

echo "Build scrypt"
emcc "${EMCC_OPTIONS[@]}" "${EMCC_WEB_OPTIONS[@]}" "${EMCC_SCRYPT_OPTIONS[@]}" "${EMCC_WASM_OPTIONS[@]}" $SCRYPT_DIR/.libs/*.a -o lib/scrypt.js
