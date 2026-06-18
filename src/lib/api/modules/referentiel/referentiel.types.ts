export interface PaysDto {
  id: string
  code: string
  name: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface PaysListEnvelopeDto {
  success: boolean
  message: string
  data: PaysDto[]
}
