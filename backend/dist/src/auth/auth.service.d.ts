import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PasswordService } from './password.service';
export declare class AuthService {
    private readonly jwtService;
    private readonly passwordService;
    private readonly prisma;
    constructor(jwtService: JwtService, passwordService: PasswordService, prisma: PrismaService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            displayName: string | null;
            role: string;
            createdAt: Date;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            displayName: string | null;
            role: string;
            createdAt: Date;
        };
    }>;
    me(userId: string): Promise<{
        id: string;
        email: string;
        displayName: string | null;
        role: string;
        createdAt: Date;
    }>;
    private toAuthResponse;
    private toPublicUser;
}
