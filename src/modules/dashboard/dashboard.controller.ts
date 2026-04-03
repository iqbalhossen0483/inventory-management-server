import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGaurd } from 'src/guards/AuthGaurd';
import { ActivityService } from 'src/services/activity.service';
import { GetDashboardDataDto } from './dashboard.dto';
import { DashboardService } from './dashboard.service';

@UseGuards(AuthGaurd)
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly ActivityService: ActivityService,
  ) {}

  @Get()
  getDashboardReport(@Query() queries: GetDashboardDataDto) {
    return this.dashboardService.getDashboardReport(queries);
  }

  @Get('activities')
  getAllActivities() {
    return this.ActivityService.getAllActivities();
  }
}
