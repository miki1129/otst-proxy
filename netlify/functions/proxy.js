// netlify/functions/proxy.js
exports.handler = async (event) => {
  // 处理预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  // 只允许 POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const data = JSON.parse(event.body);
    
    // Lark webhook URL
    const LARK_URL = 'https://open.larksuite.com/open-apis/bot/v2/hook/f6e8cff0-2384-4f05-807e-a772ec0719f5';

    // 发送到 Lark
    const response = await fetch(LARK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msg_type: 'post',
        content: {
          post: {
            en_us: {
              title: `OTST Report - ${data.name}`,
              content: [[{
                tag: 'text',
                text: `Name: ${data.name}\nScore: ${data.score}/100\nResult: ${data.passed ? '✅ PASS' : '❌ FAIL'}\nAttempt: ${data.attempt}\nTime: ${data.timestamp}\n\nWeak Areas: ${data.weakPoints}`
              }]]
            }
          }
        }
      })
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
