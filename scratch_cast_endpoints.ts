
  // ==========================================
  // ADMIN CASTS
  // ==========================================

  @ApiOperation({ summary: 'Admin action: List casts' })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/casts')
  listAdminCasts(@Query() query: import('./dto/admin-store.dto').AdminStoreQueryDto) {
    return this.nightlifeDataService.listAdminCasts(query);
  }

  @ApiOperation({ summary: 'Admin action: Check cast slug availability' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: { available: { type: 'boolean' } },
      example: { available: true }
    }
  })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin/casts/check-slug')
  checkAdminCastSlug(@Query('slug') slug: string) {
    return this.nightlifeDataService.checkAdminCastSlug(slug);
  }

  @ApiOperation({ summary: 'Admin action: Create a new cast' })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('admin/casts')
  createAdminCast(
    @Body() dto: import('./dto/admin-cast.dto').CreateAdminCastDto,
  ) {
    return this.nightlifeDataService.createAdminCast(dto);
  }

  @ApiOperation({ summary: 'Admin action: Update an existing cast' })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('admin/casts/:id')
  updateAdminCast(
    @Param('id') id: string,
    @Body() dto: import('./dto/admin-cast.dto').UpdateAdminCastDto,
  ) {
    return this.nightlifeDataService.updateAdminCast(id, dto);
  }
