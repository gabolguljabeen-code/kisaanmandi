import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  statusCode: number;
  code: string;
  message_en: string;
  message_ur: string;
  details?: { field: string; message_en: string; message_ur: string }[];

  constructor(
    statusCode: number,
    code: string,
    message_en: string,
    message_ur: string,
    details?: { field: string; message_en: string; message_ur: string }[]
  ) {
    super(message_en);
    this.statusCode = statusCode;
    this.code = code;
    this.message_en = message_en;
    this.message_ur = message_ur;
    this.details = details;
  }
}

export function notFoundError(entity_en = 'Resource', entity_ur = 'وسیلہ') {
  return new AppError(
    404,
    'not_found',
    `${entity_en} not found.`,
    `${entity_ur} نہیں ملا۔`
  );
}

export function unauthorizedError() {
  return new AppError(
    401,
    'unauthorized',
    'Authentication required. Please provide a valid X-User-Id header.',
    'لاگ ان درکار ہے۔ براہ کرم درست شناختی تفصیلات فراہم کریں۔'
  );
}

export function forbiddenRoleError() {
  return new AppError(
    403,
    'forbidden_role',
    'Access restricted. Only farmers can perform this action.',
    'رسائی محدود ہے۔ یہ عمل صرف کسان ہی انجام دے سکتے ہیں۔'
  );
}

export function notOwnerError() {
  return new AppError(
    403,
    'not_owner',
    'Access denied. You do not own this resource.',
    'رسائی مسترد۔ آپ اس اندراج کے مالک نہیں ہیں۔'
  );
}

export function phoneExistsError() {
  return new AppError(
    409,
    'phone_exists',
    'A user with this phone number already exists.',
    'اس فون نمبر کے ساتھ صارف پہلے سے موجود ہے۔'
  );
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message_en: err.message_en,
        message_ur: err.message_ur,
        details: err.details,
      },
    });
  }

  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => {
      const field = issue.path.join('.');
      return {
        field,
        message_en: issue.message,
        message_ur: translateZodMessageToUrdu(field, issue.message),
      };
    });

    return res.status(422).json({
      error: {
        code: 'validation_error',
        message_en: details[0]?.message_en || 'Validation failed.',
        message_ur: details[0]?.message_ur || 'درست معلومات فراہم کریں۔',
        details,
      },
    });
  }

  console.error('Unhandled server error:', err);
  return res.status(500).json({
    error: {
      code: 'server_error',
      message_en: 'An internal server error occurred.',
      message_ur: 'سرور میں اندرونی خرابی پیش آگئی ہے۔',
    },
  });
}

function translateZodMessageToUrdu(field: string, msgEn: string): string {
  if (field === 'quantity') return 'مقدار صفر سے زیادہ ہونی چاہیے۔';
  if (field === 'asking_price') return 'طلب کردہ قیمت صفر سے زیادہ ہونی چاہیے۔';
  if (field === 'contact_phone' || field === 'phone')
    return 'درست ۱۱ ہندسوں کا پاکستانی فون نمبر (03XXXXXXXXX) درج کریں۔';
  if (field === 'name') return 'نام 2 سے 60 حروف کے درمیان ہونا چاہیے۔';
  if (field === 'district') return 'براہ کرم سندھ کا درست ضلع منتخب کریں۔';
  if (field === 'available_from') return 'دستیابی کی تاریخ ماضی کی نہیں ہو سکتی۔';
  if (field === 'grade') return 'گریڈ A، B، یا C ہونا چاہیے۔';
  if (field === 'target_price') return 'ہدف قیمت صفر سے زیادہ ہونی چاہیے۔';
  return 'براہ کرم درست معلومات درج کریں۔';
}
