# Logger Configuration Examples

## Development Logs (NODE_ENV=development)

```
[INFO] [a1b2c3d4-e5f6-7890-abcd-ef1234567890] Application is running on: http://localhost:3000
[INFO] [a1b2c3d4-e5f6-7890-abcd-ef1234567890] Swagger documentation available at: http://localhost:3000/api/docs
[INFO] [AuthService] [a1b2c3d4-e5f6-7890-abcd-ef1234567890] Intento de login para usuario: user@example.com
[INFO] [AuthService] [a1b2c3d4-e5f6-7890-abcd-ef1234567890] Login exitoso para usuario: user@example.com
[WARN] [AuthService] [b2c3d4e5-f6a7-8901-bcde-f23456789012] Login fallido - contraseña inválida: user@example.com
```

## Production Logs (NODE_ENV=production)

```json
{"level":30,"time":1698425400000,"pid":12345,"hostname":"server-prod","app":"nest-service-starter","version":"1.0.0","environment":"production","context":"AppLogger","correlationId":"a1b2c3d4-e5f6-7890-abcd-ef1234567890","msg":"Application is running on: http://localhost:3000"}
{"level":30,"time":1698425401000,"pid":12345,"hostname":"server-prod","app":"nest-service-starter","version":"1.0.0","environment":"production","context":"AuthService","correlationId":"a1b2c3d4-e5f6-7890-abcd-ef1234567890","userId":"123e4567-e89b-12d3-a456-426614174000","email":"user@example.com","msg":"Login exitoso para usuario: user@example.com"}
```

## Log Levels Available

- `fatal` (60): Critical errors that may cause the application to stop
- `error` (50): Error conditions that should be investigated
- `warn` (40): Warning conditions that should be noted
- `info` (30): Informational messages about normal operation
- `debug` (20): Debug information for development
- `trace` (10): Very detailed tracing information

## Configuration Options

### Environment Variables

```bash
# Set log level (default: info)
LOG_LEVEL=debug

# Set environment (affects log format)
NODE_ENV=production
```

### Log Format

- **Development**: Human-readable with colors and spacing
- **Production**: JSON format structured for log aggregation systems

## Integration with Log Management

The logs are ready for integration with:
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Datadog**
- **Splunk**
- **Grafana Loki**
- **CloudWatch Logs**