import { Request, Response } from "express";

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
}

export class PaginationUtil {
  static readonly DEFAULT_PAGE = 1;
  static readonly DEFAULT_LIMIT = 10;
  static readonly MAX_LIMIT = 100;

  /**
   * Parse pagination parameters from request query
   */
  static parsePaginationParams(req: Request): PaginationOptions {
    const page = Math.max(
      1,
      parseInt(req.query.page as string) || this.DEFAULT_PAGE
    );
    const limit = Math.min(
      this.MAX_LIMIT,
      Math.max(1, parseInt(req.query.limit as string) || this.DEFAULT_LIMIT)
    );
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

    return {
      page: page,
      limit: limit,
      sortBy: sortBy,
      sortOrder: sortOrder,
    };
  }

  /**
   * Create pagination result
   */
  static createPaginationResult<T>(
    data: T[],
    totalItems: number,
    options: PaginationOptions
  ): PaginationResult<T> {
    const page = options.page || this.DEFAULT_PAGE;
    const limit = options.limit || this.DEFAULT_LIMIT;
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null,
      },
    };
  }

  /**
   * Create MongoDB query options for pagination
   */
  static createMongoQueryOptions(options: PaginationOptions) {
    const page = options.page || this.DEFAULT_PAGE;
    const limit = options.limit || this.DEFAULT_LIMIT;
    const sortBy = options.sortBy || "createdAt";
    const sortOrder = options.sortOrder || "desc";
    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    return {
      skip,
      limit,
      sort,
    };
  }

  /**
   * Validate pagination parameters
   */
  static validatePaginationParams(
    req: Request,
    res: Response
  ): PaginationOptions | null {
    const { page, limit, sortOrder } = req.query;

    // Validate page
    if (page && (isNaN(Number(page)) || Number(page) < 1)) {
      res.status(400).json({
        success: false,
        message: "Page must be a positive integer",
      });
      return null;
    }

    // Validate limit
    if (
      limit &&
      (isNaN(Number(limit)) ||
        Number(limit) < 1 ||
        Number(limit) > this.MAX_LIMIT)
    ) {
      res.status(400).json({
        success: false,
        message: `Limit must be between 1 and ${this.MAX_LIMIT}`,
      });
      return null;
    }

    // Validate sortOrder
    if (sortOrder && !["asc", "desc"].includes(sortOrder as string)) {
      res.status(400).json({
        success: false,
        message: 'Sort order must be either "asc" or "desc"',
      });
      return null;
    }

    return this.parsePaginationParams(req);
  }

  /**
   * Get pagination metadata for Swagger documentation
   */
  static getSwaggerPaginationParams() {
    return [
      {
        in: "query",
        name: "page",
        schema: {
          type: "integer",
          minimum: 1,
          default: 1,
        },
        description: "Page number (starts from 1)",
        example: 1,
      },
      {
        in: "query",
        name: "limit",
        schema: {
          type: "integer",
          minimum: 1,
          maximum: 100,
          default: 10,
        },
        description: "Number of items per page (max 100)",
        example: 10,
      },
      {
        in: "query",
        name: "sortBy",
        schema: {
          type: "string",
          default: "createdAt",
        },
        description: "Field to sort by",
        example: "createdAt",
      },
      {
        in: "query",
        name: "sortOrder",
        schema: {
          type: "string",
          enum: ["asc", "desc"],
          default: "desc",
        },
        description: "Sort order",
        example: "desc",
      },
    ];
  }

  /**
   * Get pagination response schema for Swagger
   */
  static getSwaggerPaginationSchema(itemSchema: any) {
    return {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: itemSchema,
        },
        pagination: {
          type: "object",
          properties: {
            currentPage: {
              type: "integer",
              example: 1,
            },
            totalPages: {
              type: "integer",
              example: 5,
            },
            totalItems: {
              type: "integer",
              example: 50,
            },
            itemsPerPage: {
              type: "integer",
              example: 10,
            },
            hasNextPage: {
              type: "boolean",
              example: true,
            },
            hasPrevPage: {
              type: "boolean",
              example: false,
            },
            nextPage: {
              type: "integer",
              nullable: true,
              example: 2,
            },
            prevPage: {
              type: "integer",
              nullable: true,
              example: null,
            },
          },
        },
      },
    };
  }
}
