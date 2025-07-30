<template>
  <el-dialog :model-value="visible" @update:model-value="handleVisibleChange" :title="isEdit ? '编辑知识库' : '创建知识库'" width="500px" :before-close="handleClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" @submit.prevent="handleSubmit">
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入知识库名称" maxlength="50" show-word-limit />
      </el-form-item>
      
      <el-form-item label="描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入知识库描述（可选）" maxlength="200" show-word-limit />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  knowledgeBase: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'submit'])

const formRef = ref()
const loading = ref(false)

// 计算是否为编辑模式
const isEdit = computed(() => !!props.knowledgeBase)

// 表单数据
const form = reactive({
  name: '',
  description: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入知识库名称', trigger: 'blur' },
    { min: 1, max: 50, message: '名称长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '描述长度不能超过 200 个字符', trigger: 'blur' }
  ]
}

// 监听弹框显示状态，初始化表单数据
watch(() => props.visible, (newVal) => {
  console.log('弹框显示状态变化:', newVal, props.knowledgeBase)
  if (newVal) {
    if (props.knowledgeBase) {
      // 编辑模式：填充现有数据
      form.name = props.knowledgeBase.name
      form.description = props.knowledgeBase.description || ''
      console.log('填充编辑数据:', form)
    } else {
      // 创建模式：清空表单
      form.name = ''
      form.description = ''
      console.log('清空创建表单')
    }
  }
})

// 处理弹框显示状态变化
const handleVisibleChange = (value) => {
  emit('update:visible', value)
}

// 关闭弹框
const handleClose = () => {
  emit('update:visible', false)
  formRef.value?.resetFields()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    const data = {
      name: form.name.trim(),
      description: form.description.trim()
    }
    
    emit('submit', data)
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-textarea__inner) {
  font-family: inherit;
}
</style> 