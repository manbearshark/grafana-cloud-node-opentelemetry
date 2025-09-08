# Use the official Grafana Alloy image
FROM grafana/alloy:latest

# Copy the Alloy configuration
COPY config.alloy /etc/alloy/config.alloy

# Expose ports for OTLP and metrics
EXPOSE 4317 4318 9100 9256 9323 12345

# Set the configuration file
ENTRYPOINT ["/bin/alloy", "run", "/etc/alloy/config.alloy"]
