import type {
  TelegramGetUpdatesResponse,
  TelegramErrorResponse,
  TelegramUpdate,
} from '../types/telegram'

export class TelegramService {
  private botToken: string
  private baseUrl: string

  constructor(botToken: string) {
    this.botToken = botToken
    this.baseUrl = `https://api.telegram.org/bot${botToken}`
  }

  /**
   * Get updates from Telegram API
   * @param offset - Identifier of the first update to be returned
   * @param limit - Limits the number of updates to be retrieved (1-100, default 100)
   * @param timeout - Timeout in seconds for long polling (0-50, default 0)
   * @returns Promise with Telegram updates
   */
  async getUpdates(
    offset?: number,
    limit: number = 100,
    timeout: number = 0
  ): Promise<TelegramUpdate[]> {
    const url = new URL(`${this.baseUrl}/getUpdates`)

    if (offset !== undefined) {
      url.searchParams.append('offset', offset.toString())
    }
    url.searchParams.append('limit', limit.toString())
    url.searchParams.append('timeout', timeout.toString())

    const response = await fetch(url.toString())
    const data = (await response.json()) as
      | TelegramGetUpdatesResponse
      | TelegramErrorResponse

    if (!data.ok) {
      throw new Error(
        `Telegram API Error: ${(data as TelegramErrorResponse).description}`
      )
    }

    return (data as TelegramGetUpdatesResponse).result
  }

  /**
   * Send a text message to a chat
   * @param chatId - Unique identifier for the target chat
   * @param text - Text of the message to be sent
   * @returns Promise with the sent message
   */
  async sendMessage(chatId: number, text: string) {
    const url = `${this.baseUrl}/sendMessage`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
      }),
    })

    const data = await response.json()

    if (!data.ok) {
      throw new Error(`Telegram API Error: ${data.description}`)
    }

    return data.result
  }

  /**
   * Get information about the bot
   * @returns Promise with bot information
   */
  async getMe() {
    const url = `${this.baseUrl}/getMe`
    const response = await fetch(url)
    const data = await response.json()

    if (!data.ok) {
      throw new Error(`Telegram API Error: ${data.description}`)
    }

    return data.result
  }
}
