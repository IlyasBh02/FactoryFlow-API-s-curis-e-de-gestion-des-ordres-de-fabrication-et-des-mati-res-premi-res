const success = (res, data, statusCode = 200) =>
  res.status(statusCode).json({ status: 'success', data });

const paginated = (res, { items, total, page, limit }) =>
  res.status(200).json({
    status: 'success',
    data: items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });

module.exports = { success, paginated };