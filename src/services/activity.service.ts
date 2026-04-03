import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActivityEntity } from 'src/entites/activity.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(ActivityEntity)
    private activityRepository: Repository<ActivityEntity>,
  ) {}

  async createActivity(description: string) {
    const activity = this.activityRepository.create({ description });
    return await this.activityRepository.save(activity);
  }

  async getAllActivities() {
    const activities = await this.activityRepository.find({
      order: {
        created_at: 'DESC',
      },
      take: 10,
    });

    return {
      success: true,
      message: 'Activities fetched successfully',
      data: activities,
    };
  }
}
