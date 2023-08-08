FROM mcr.microsoft.com/devcontainers/base:debian

ENV DENO_INSTALL=/home/vscode/.deno
RUN mkdir -p ${DENO_INSTALL} \
    && curl -fsSL https://deno.land/x/install/install.sh | sh \
    && chown -R vscode ${DENO_INSTALL}

ENV PATH=${DENO_INSTALL}/bin:${PATH} \
    DENO_DIR=${DENO_INSTALL}/.cache/deno
