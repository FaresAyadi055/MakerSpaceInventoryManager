// server/api/components/index.get.ts
import { defineEventHandler, getQuery, createError } from 'h3'
import Component from '~/server/models/Components'
import connectDB from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()
    
    const query = getQuery(event)
    const { 
      search, 
      location, 
      minQuantity, 
      maxQuantity,
      sortBy = 'model',
      sortOrder = 'asc',
      page = 1,
      limit = 400
    } = query

    // Build filter object
    const filter: any = {}

    // Search by model or description
    if (search) {
      filter.$or = [
        { model: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    // Filter by location
    if (location) {
      // Handle both string and number locations
      const locationValue = isNaN(Number(location)) ? location : Number(location)
      filter.location = locationValue
    }

    // Filter by quantity range
    if (minQuantity !== undefined || maxQuantity !== undefined) {
      filter.quantity = {}
      if (minQuantity !== undefined) filter.quantity.$gte = Number(minQuantity)
      if (maxQuantity !== undefined) filter.quantity.$lte = Number(maxQuantity)
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit)
    
    // Build sort object
    const sort: any = {}
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1

    // Execute query
    const [components, total] = await Promise.all([
      Component.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Component.countDocuments(filter)
    ])

    return {
      success: true,
      data: components,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }

  } catch (error: any) {
    console.error('Error fetching components:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch components'
    })
  }
})