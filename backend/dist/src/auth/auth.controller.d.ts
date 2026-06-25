import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    me(request: Request & {
        user: {
            id: string;
        };
    }): Promise<{
        id: string;
        email: string;
        displayName: string | null;
        role: string;
        createdAt: Date;
    }>;
}
