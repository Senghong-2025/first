export interface TelegramUser {
  id: number
  is_bot: boolean
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}

export interface TelegramChat {
  id: number
  type: 'private' | 'group' | 'supergroup' | 'channel'
  title?: string
  username?: string
  first_name?: string
  last_name?: string
}

export interface TelegramMessage {
  message_id: number
  from?: TelegramUser
  date: number
  chat: TelegramChat
  text?: string
  photo?: Array<{
    file_id: string
    file_unique_id: string
    file_size?: number
    width: number
    height: number
  }>
  document?: {
    file_id: string
    file_unique_id: string
    file_name?: string
    mime_type?: string
    file_size?: number
  }
}

export interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
  edited_message?: TelegramMessage
  channel_post?: TelegramMessage
  edited_channel_post?: TelegramMessage
}

export interface TelegramGetUpdatesResponse {
  ok: boolean
  result: TelegramUpdate[]
}

export interface TelegramErrorResponse {
  ok: false
  error_code: number
  description: string
}
