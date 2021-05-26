import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { SocketIOAdapter } from './socketio.adapter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors()
  app.useWebSocketAdapter(new SocketIOAdapter(app, []))
  await app.listen(3001)
}
bootstrap()
