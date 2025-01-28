// index.js
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors')
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
const allowedOrigins = ['https://bilibiliex.com', 'https://www.bilibiliex.com'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(bodyParser.json());

app.get('/video/:id*', (req, res) => {
  const { id } = req.params;

  // 把 query 换换成 string
  let query = Object.keys(req.query).map(key => `${key}=${req.query[key]}`).join('&');
  if (query) {
    query = `&${query}`;
  }
  res.redirect(308, `/?vid=${id}${query}&bvs=1`);
});

// 获取 B 站视频封面的 API
app.get('/api/bcover', async (req, res) => {
  const { vid } = req.query;

  // 确保 vid 参数不为空
  if (!vid) {
    return res.status(400).json({ message: 'Bad Request: vid is required' });
  }

  try {
    // 请求 B 站的 API 获取视频数据
    const apiUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${vid}`;

    // 获取视频信息
    const response = await axios.get(apiUrl);
    const videoData = response.data.data;

    // 返回封面图片的 URL
    const coverImageUrl = videoData.pic;
    res.json({ coverImageUrl });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/api/feedback', async (req, res) => {
  // 获取请求体中的 email 和 feedback 参数
  const { email, feedback } = req.body;

  // 验证 email 和 feedback 是否存在
  if (!feedback) {
    return res.status(400).json({ message: '反馈内容必须填写' });
  }
  let content = ''
  if (email) {
    content = `邮箱: ${email}\n反馈内容:\n${feedback}`
  } else {
    content = `反馈内容:\n${feedback}`
  }
  const data = {
    msgtype: 'text',
    text: {
      content
    }
  }
  // 请求 B 站的 API 获取视频数据
  const apiUrl = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=783886df-4356-44b3-99b9-a86a9e52c618`;

  try {
    // 获取视频信息
    const response = await axios.post(apiUrl, data);
    // 假设这里存储或处理完反馈后，返回一个成功响应
    res.status(200).json({ message: '反馈提交成功', data: response.data });
  } catch (error) {
    return res.status(500).json({ message: '反馈出错' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Redirect server is running on http://localhost:${PORT}`);
});

