import { Injectable } from '@nestjs/common';

interface DailyRoom {
  id: string;
  name: string;
  url: string;
  created_at: string;
}

interface DailyMeetingToken {
  token: string;
}

@Injectable()
export class DailyService {
  private readonly apiKey = process.env.DAILY_API_KEY || '';
  private readonly baseUrl = 'https://api.daily.co/v1';

  async createRoom(appointmentId: string): Promise<DailyRoom> {
    const expiryTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

    const response = await fetch(`${this.baseUrl}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        name: `appt-${appointmentId}`,
        properties: {
          exp: expiryTimestamp,
          enable_recording: false,
          enable_chat: true,
          max_participants: 2,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Daily.co room creation failed: ${response.status}`);
    }

    return response.json();
  }

  async createMeetingToken(roomName: string, userName: string, isOwner: boolean): Promise<string> {
    const expiryTimestamp = Math.floor(Date.now() / 1000) + 3600;

    const response = await fetch(`${this.baseUrl}/meeting-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_name: userName,
          is_owner: isOwner,
          exp: expiryTimestamp,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Daily.co token creation failed: ${response.status}`);
    }

    const data: DailyMeetingToken = await response.json();
    return data.token;
  }

  async deleteRoom(roomName: string): Promise<void> {
    await fetch(`${this.baseUrl}/rooms/${roomName}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });
  }
}
