import { Controller, Get, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserRole } from '@prisma/client';

@ApiTags('Utilisateurs')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()

    findAll() {
        return this.usersService.findAll();
    }

    @Patch(':id/role')

    updateRole(@Param('id', ParseIntPipe) id: number, @Body('role') role: UserRole) {
        return this.usersService.updateRole(id, role);
    }

    @Patch(':id/toggle-active')

    toggleActive(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.toggleActive(id);
    }
}
