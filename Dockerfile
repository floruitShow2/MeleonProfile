# 指定node镜像
FROM node:18 as builder

# 指定工作目录
WORKDIR /code

# 代码复制到容器中
ADD . /code

# 安装依赖
RUN npm install --registry=https://registry.npm.taobao.org

# 打包
RUN npm run build

# RUN ls

# 指定nginx镜像
FROM nginx:latest

COPY nginx.conf /etc/nginx/nginx.conf

# 复制打包后的代码到nginx容器中
COPY --from=builder /code/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 3000