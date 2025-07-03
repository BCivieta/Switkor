// src/auth/email.service.ts

import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    console.log('Inicializando EmailService con API key:', process.env.RESEND_API_KEY ? '✅ OK' : '❌ MISSING');
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendPasswordReset(to: string, token: string) {
    const resetUrl = `${process.env.FRONTEND_PUBLIC_URL}/reset-password?token=${token}`;
    console.log(`Enviando email a: ${to} con token: ${token}`);
    try {
      const result = await this.resend.emails.send({
        from: 'Switkor <onboarding@resend.dev>',
        to,
        subject: 'Restablece tu contraseña en Switkor',
        html: `
          <p>Hola,</p>
          <p>Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
          <p>— El equipo de Switkor</p>
        `,
      });
      console.log('Email enviado correctamente:', result);
    } catch (error) {
      console.error('Error enviando email:', error);
      throw error; // para que se propague y puedas manejarlo en el controlador o servicio que llame
    }
  }
}
