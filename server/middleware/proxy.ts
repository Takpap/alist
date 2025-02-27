import { createProxyMiddleware } from 'http-proxy-middleware'

export default defineEventHandler(async (event) => {
  const req = event.node.req
  const url = event.node.req.url

  if (!url?.startsWith('/proxy/')) {
    return
  }

  // 从路径中提取域名
  // 路径格式: /proxy/domain.com/path
  const match = url.match(/^\/proxy\/([^\/]+)(.*)/)
  if (!match) {
    return
  }

  const [_, domain, remainingPath] = match
  const target = `https://${domain}${remainingPath}`

  try {
    // 设置响应头
    setResponseHeaders(event, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    })

    // 处理 OPTIONS 请求
    if (req.method === 'OPTIONS') {
      return
    }

    // 代理请求
    return await proxyRequest(event, target, {
      headers: {
        host: domain
      }
    })
  } catch (error: any) {
    console.error('代理请求错误:', error)
    throw createError({
      statusCode: 500,
      message: error?.message || 'Proxy request failed'
    })
  }
}) 