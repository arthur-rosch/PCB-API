import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { USERNAME_WEBHOOK, PASSWORD_WEBHOOK } from 'src/configs/general.config';

@Injectable()
export class VerifySignatureMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const verifySignatureHeader = req.headers['verify-signature'];
    if (!verifySignatureHeader || typeof verifySignatureHeader !== 'string') {
      return res.status(401).json({ message: 'Missing or invalid Verify-Signature header' });
    }

    const verifySignatureParts = this.splitHeader(verifySignatureHeader);

    let timestamp: string | undefined;
    let vsignature: string | undefined;

    verifySignatureParts.forEach(part => {
      const [key, value] = part.trim().split('=');
      if (key === 't') {
        timestamp = value;
      } else if (key === 'vsign') {
        vsignature = value;
      }
    });

    const authHeader = req.headers.authorization;
    if (!authHeader || typeof authHeader !== 'string') {
      return res.status(401).json({ message: 'Missing or invalid Authorization header' });
    }

    const authParts = authHeader.split(' ');
    if (authParts.length !== 2 || authParts[0].toLowerCase() !== 'basic') {
      return res.status(401).json({ message: 'Invalid Authorization header format' });
    }

    const base64Credentials = authParts[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');

    console.log('username', username)
    console.log('password', password)
    console.log('Timestamp:', timestamp);
    console.log('VSignature:', vsignature);

    if (username !== USERNAME_WEBHOOK || password !== PASSWORD_WEBHOOK) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    next();
  }

  private splitHeader(header: string): string[] {
    return header.split(',');
  }
}
