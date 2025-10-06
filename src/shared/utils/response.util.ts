import { Response } from "express";

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export interface PaginatedData<T> {
  data: T[];
  pagination: PaginationMeta;
}

export class ResponseUtil {
  static success(
    res: Response,
    data: any,
    message: string = "Success",
    statusCode: number = 200
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      code: statusCode,
    });
  }

  static successWithPagination<T>(
    res: Response,
    data: T[],
    pagination: PaginationMeta,
    message: string = "Data retrieved successfully",
    statusCode: number = 200
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data: {
        data,
        pagination,
      },
      code: statusCode,
    });
  }

  static error(
    res: Response,
    message: string = "Error",
    statusCode: number = 500,
    data: any = null
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      data,
      code: statusCode,
    });
  }

  static validationError(
    res: Response,
    message: string = "Validation Error",
    data: any = null
  ) {
    return res.status(400).json({
      success: false,
      message,
      data,
      code: 400,
    });
  }

  static unauthorized(res: Response, message: string = "Unauthorized") {
    return res.status(401).json({
      success: false,
      message,
      code: 401,
    });
  }

  static forbidden(res: Response, message: string = "Forbidden") {
    return res.status(403).json({
      success: false,
      message,
      code: 403,
    });
  }

  static notFound(res: Response, message: string = "Not Found") {
    return res.status(404).json({
      success: false,
      message,
      code: 404,
    });
  }
}
