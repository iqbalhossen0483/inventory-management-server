import { Controller, Get, Query } from '@nestjs/common';
import { GetDashboardDataDto } from './dashboard.dto';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getDashboardReport(@Query() queries: GetDashboardDataDto) {
    return this.dashboardService.getDashboardReport(queries);
  }
}
