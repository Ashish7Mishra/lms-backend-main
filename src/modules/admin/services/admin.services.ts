// modules/admin/services/admin.service.ts

import User from "../../user/models/user.model";
import Course from "../../course/models/course.model";
import Enrollment from "../../enrollment/models/enrollment.model";
import {
  PaginationOptions,
  PaginationResult,
  PaginationUtil,
} from "../../../shared/utils/pagination.util";

export class AdminService {
  
  static async getDashboardStats() {
    const [totalStudents, totalInstructors, totalCourses, totalEnrollments] =
      await Promise.all([
        User.countDocuments({ role: "Student" }),
        User.countDocuments({ role: "Instructor" }),
        Course.countDocuments({}),
        Enrollment.countDocuments({}),
      ]);

    return {
      totalStudents,
      totalInstructors,
      totalCourses,
      totalEnrollments,
    };
  }

  static async getRecentActivities(limit: number = 10) {
    const [recentUsers, recentCourses, recentEnrollments] = await Promise.all([
      User.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .select("name email role isActive createdAt"),
      
      Course.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("instructor", "name email")
        .select("title instructor isActive createdAt"),
      
      Enrollment.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("student", "name email")
        .populate("course", "title")
        .select("student course createdAt"),
    ]);

    return {
      recentUsers,
      recentCourses,
      recentEnrollments,
    };
  }

  // ===== USER MANAGEMENT =====
  static async getAllUsers(
    options: PaginationOptions,
    filters?: { role?: string; isActive?: string; search?: string }
  ): Promise<PaginationResult<any>> {
    const queryOptions = PaginationUtil.createMongoQueryOptions(options);
    
    const query: any = {};
    
    // Filter by role
    if (filters?.role) {
      query.role = filters.role;
    }
    
    // Filter by active status
    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive === "true";
    }
    
    // Search by name or email
    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { email: { $regex: filters.search, $options: "i" } },
      ];
    }

    const totalItems = await User.countDocuments(query);
    
    const users = await User.find(query)
      .select("-password")
      .sort(queryOptions.sort)
      .skip(queryOptions.skip)
      .limit(queryOptions.limit);

    return PaginationUtil.createPaginationResult(users, totalItems, options);
  }

  static async getUserById(userId: string) {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new Error("User not found");
    }

    // Get additional stats
    const enrollmentCount = await Enrollment.countDocuments({ student: userId });
    const courseCount = await Course.countDocuments({ instructor: userId });

    return {
      ...user.toObject(),
      stats: {
        enrollments: enrollmentCount,
        coursesCreated: courseCount,
      },
    };
  }

  static async toggleUserStatus(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    user.isActive = !user.isActive;
    await user.save();

    return user;
  }

  static async getAllCourses(
    options: PaginationOptions,
    filters?: { category?: string; isActive?: string; search?: string; instructorId?: string }
  ): Promise<PaginationResult<any>> {
    const queryOptions = PaginationUtil.createMongoQueryOptions(options);
    
    const query: any = {};
    
    // Filter by category
    if (filters?.category) {
      query.category = filters.category;
    }
    
    // Filter by active status
    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive === "true";
    }
    
    // Filter by instructor
    if (filters?.instructorId) {
      query.instructor = filters.instructorId;
    }
    
    // Search by title or description
    if (filters?.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ];
    }

    const totalItems = await Course.countDocuments(query);
    
    const courses = await Course.find(query)
      .populate("instructor", "name email")
      .sort(queryOptions.sort)
      .skip(queryOptions.skip)
      .limit(queryOptions.limit);

    // Get enrollment count for each course
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const enrollmentCount = await Enrollment.countDocuments({
          course: course._id,
        });
        return {
          ...course.toObject(),
          enrollmentCount,
        };
      })
    );

    return PaginationUtil.createPaginationResult(
      coursesWithStats,
      totalItems,
      options
    );
  }

  static async getCourseById(courseId: string) {
    const course = await Course.findById(courseId).populate(
      "instructor",
      "name email"
    );
    
    if (!course) {
      throw new Error("Course not found");
    }

    // Get additional stats
    const enrollmentCount = await Enrollment.countDocuments({ course: courseId });

    return {
      ...course.toObject(),
      enrollmentCount,
    };
  }

  static async toggleCourseStatus(courseId: string) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    course.isActive = !course.isActive;
    await course.save();

    return course;
  }
}