FROM lukemathwalker/cargo-chef:latest-rust-latest as chef
WORKDIR /app
RUN apt update && apt install lld clang -y

FROM chef as planner
COPY . .
# Create a dependency lock file
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json
# Build just dependencies to cache them
RUN cargo chef cook --release --recipe-path recipe.json
COPY . .
RUN cargo build --release --bin fargate-fun-rust-api

FROM debian:bullseye-slim AS runtime
WORKDIR /app
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && apt-get autoremove -y \
  && apt-get clean -y \
  && rm -rf /var/lib/apt/lists/*
# Copy compile binary from the builder step to runtime step
COPY --from=builder /app/target/release/fargate-fun-rust-api fargate-fun-rust-api
ENV APP_ENV production
EXPOSE 80
ENTRYPOINT ["./fargate-fun-rust-api"]
