
import { sequelize } from './src/config/database';
import Employee from './src/models/Employee';
import User from './src/models/User';

(async () => {
  try {
    await sequelize.sync();
    const user = await User.findOne();
    if (user) {
      const existing = await Employee.findOne({ where: { userId: user.id } });
      if (!existing) {
        await Employee.create({
          userId: user.id,
          department: 'Massage',
          designation: 'Therapist',
          skills: { massage: 5 }, // Ensure this matches ServiceCategory slug
          commissionRate: 10,
          hourlyRate: 50
        });
        console.log('Employee seeded successfully');
      } else {
        console.log('Employee already exists');
      }
    } else {
      console.log('No user found');
    }
  } catch (error) {
    console.error('Error seeding employee:', error);
  }
})();
