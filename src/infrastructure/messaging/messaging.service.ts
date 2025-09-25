import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class MessagingService implements OnModuleInit, OnModuleDestroy {
  private connection: any = null;
  private channel: any = null;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      const rabbitmqUrl = this.configService.get<string>('RABBITMQ_URL') || 'amqp://admin:kargaran1367@localhost:5672';
      console.log('Connecting to RabbitMQ at:', rabbitmqUrl);
      
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      // Declare exchanges
      await this.channel.assertExchange('tenant-events', 'topic', { durable: true });
      await this.channel.assertExchange('user-events', 'topic', { durable: true });
      await this.channel.assertExchange('notification-events', 'topic', { durable: true });
      await this.channel.assertExchange('institutional-events', 'topic', { durable: true });
      await this.channel.assertExchange('operational-events', 'topic', { durable: true });

      console.log('RabbitMQ connection established successfully');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      // Don't throw error to allow service to start without RabbitMQ initially
    }
  }

  async onModuleDestroy() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      console.log('RabbitMQ connections closed');
    } catch (error) {
      console.error('Error closing RabbitMQ connections:', error);
    }
  }

  async publishEvent(exchange: string, event: any): Promise<void> {
    try {
      if (!this.channel) {
        console.warn(`Cannot publish event to ${exchange}: RabbitMQ not connected`);
        return;
      }

      const message = Buffer.from(JSON.stringify(event));
      const routingKey = event.eventType || 'default';

      const published = this.channel.publish(exchange, routingKey, message, {
        persistent: true,
        timestamp: Date.now(),
        messageId: event.eventId,
      });

      if (published) {
        console.log(`Event published to ${exchange}:`, event.eventType);
      } else {
        console.warn(`Failed to publish event to ${exchange}: Channel buffer full`);
      }
    } catch (error) {
      console.error(`Failed to publish event to ${exchange}:`, error);
      throw error;
    }
  }
}
