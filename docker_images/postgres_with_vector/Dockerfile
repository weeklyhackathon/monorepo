# Use the latest official PostgreSQL image as the base
FROM postgres:17.2-bookworm

# Install required dependencies and pgvector
RUN apt-get update

RUN apt-get update && \
    apt-get install -y postgresql-server-dev-all build-essential wget && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Download and install pgvector extension
RUN wget https://github.com/pgvector/pgvector/archive/refs/tags/v0.8.0.tar.gz && \
    tar -xzf v0.8.0.tar.gz && \
    cd pgvector-0.8.0 && \
    make && \
    make install && \
    cd .. && rm -rf pgvector-0.8.0 v0.8.0.tar.gz

# Set the default database, user, and password
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgrespw

# Expose PostgreSQL port
EXPOSE 5432