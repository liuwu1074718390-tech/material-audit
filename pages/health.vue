<template>
  <div class="health-check-page">
    <div class="container">
      <h1>系统健康检查</h1>
      <p class="subtitle">自动检测数据库连接和配置状态</p>

      <el-button 
        type="primary" 
        @click="checkHealth"
        :loading="checking"
        :icon="Refresh"
      >
        重新检查
      </el-button>

      <div v-if="healthData" class="health-result">
        <el-alert
          :type="healthData.healthy ? 'success' : 'error'"
          :title="healthData.message"
          :closable="false"
          style="margin: 20px 0;"
        />

        <div class="checks">
          <div class="check-item">
            <h3>配置检查</h3>
            <el-tag :type="getStatusType(healthData.checks.config.status)">
              {{ healthData.checks.config.status === 'ok' ? '✓ 正常' : '✗ 异常' }}
            </el-tag>
            <p>{{ healthData.checks.config.message }}</p>
            <div v-if="healthData.checks.config.status === 'ok'" class="config-details">
              <p><strong>数据库地址:</strong> {{ healthData.checks.config.host }}</p>
              <p><strong>端口:</strong> {{ healthData.checks.config.port }}</p>
              <p><strong>数据库名:</strong> {{ healthData.checks.config.database }}</p>
              <p><strong>用户名:</strong> {{ healthData.checks.config.user }}</p>
            </div>
            <div v-if="healthData.checks.config.missing?.length" class="error-details">
              <p><strong>缺少的配置项:</strong></p>
              <ul>
                <li v-for="item in healthData.checks.config.missing" :key="item">{{ item }}</li>
              </ul>
            </div>
          </div>

          <div class="check-item">
            <h3>连接检查</h3>
            <el-tag :type="getStatusType(healthData.checks.connection.status)">
              {{ healthData.checks.connection.status === 'ok' ? '✓ 正常' : '✗ 异常' }}
            </el-tag>
            <p>{{ healthData.checks.connection.message }}</p>
            <div v-if="healthData.checks.connection.code" class="error-details">
              <p><strong>错误代码:</strong> {{ healthData.checks.connection.code }}</p>
              <p v-if="healthData.checks.connection.sqlMessage">
                <strong>详细信息:</strong> {{ healthData.checks.connection.sqlMessage }}
              </p>
            </div>
          </div>

          <div class="check-item">
            <h3>表结构检查</h3>
            <el-tag :type="getStatusType(healthData.checks.tables.status)">
              {{ healthData.checks.tables.status === 'ok' ? '✓ 正常' : '✗ 异常' }}
            </el-tag>
            <p>{{ healthData.checks.tables.message }}</p>
            <div v-if="healthData.checks.tables.tables" class="success-details">
              <p><strong>已存在的表:</strong></p>
              <ul>
                <li v-for="table in healthData.checks.tables.tables" :key="table">{{ table }}</li>
              </ul>
            </div>
            <div v-if="healthData.checks.tables.missing?.length" class="error-details">
              <p><strong>缺少的表:</strong></p>
              <ul>
                <li v-for="table in healthData.checks.tables.missing" :key="table">{{ table }}</li>
              </ul>
              <p style="margin-top: 10px; color: #409EFF;">
                <strong>解决方案:</strong> 请在腾讯云 MySQL 数据库中执行 <code>database/schema.sql</code> 文件中的 SQL 语句
              </p>
            </div>
          </div>
        </div>

        <div v-if="healthData.suggestion" class="suggestion">
          <h3>建议</h3>
          <p>{{ healthData.suggestion }}</p>
        </div>
      </div>

      <div v-else-if="checking" class="loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        <p>正在检查...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Refresh, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const healthData = ref<any>(null)
const checking = ref(false)

const checkHealth = async () => {
  checking.value = true
  try {
    const { data, error } = await useFetch('/api/health/db')
    if (error.value) {
      ElMessage.error('检查失败: ' + (error.value.message || '未知错误'))
      return
    }
    healthData.value = data.value
  } catch (err: any) {
    ElMessage.error('检查失败: ' + (err.message || '未知错误'))
  } finally {
    checking.value = false
  }
}

const getStatusType = (status: string) => {
  if (status === 'ok') return 'success'
  if (status === 'error') return 'danger'
  return 'info'
}

// 页面加载时自动检查
onMounted(() => {
  checkHealth()
})
</script>

<style scoped lang="scss">
.health-check-page {
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f5f5;

  .container {
    max-width: 1000px;
    margin: 0 auto;
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    h1 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .subtitle {
      color: #666;
      margin-bottom: 20px;
    }
  }

  .health-result {
    margin-top: 20px;
  }

  .checks {
    margin-top: 20px;

    .check-item {
      margin-bottom: 30px;
      padding: 20px;
      background: #fafafa;
      border-radius: 4px;
      border-left: 4px solid #409EFF;

      h3 {
        margin: 0 0 10px 0;
        color: #333;
      }

      .el-tag {
        margin-bottom: 10px;
      }

      p {
        margin: 5px 0;
        color: #666;
      }

      .config-details,
      .success-details {
        margin-top: 15px;
        padding: 15px;
        background: #f0f9ff;
        border-radius: 4px;

        p {
          margin: 5px 0;
          color: #333;
        }

        ul {
          margin: 10px 0 0 20px;
          color: #333;
        }
      }

      .error-details {
        margin-top: 15px;
        padding: 15px;
        background: #fef0f0;
        border-radius: 4px;

        p {
          margin: 5px 0;
          color: #333;
        }

        ul {
          margin: 10px 0 0 20px;
          color: #333;
        }

        code {
          background: #fff;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: monospace;
        }
      }
    }
  }

  .suggestion {
    margin-top: 20px;
    padding: 15px;
    background: #fff7e6;
    border-radius: 4px;
    border-left: 4px solid #faad14;

    h3 {
      margin: 0 0 10px 0;
      color: #333;
    }

    p {
      margin: 0;
      color: #666;
    }
  }

  .loading {
    text-align: center;
    padding: 40px;
    color: #666;

    .el-icon {
      font-size: 32px;
      margin-bottom: 10px;
    }
  }
}
</style>

