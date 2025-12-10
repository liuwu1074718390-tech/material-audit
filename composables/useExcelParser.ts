import * as XLSX from 'xlsx'
import type { ExcelRowData } from '~/types'

/**
 * Excel解析组合式函数
 */
export const useExcelParser = () => {
  /**
   * 解析Excel文件
   * @param file 文件对象
   * @returns Promise<ExcelRowData[]>
   */
  const parseExcel = (file: File): Promise<ExcelRowData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: 'binary' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]

          // 获取表格范围
          const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
          const mappedData: ExcelRowData[] = []
          
          // 从第2行开始读取（第1行是表头，索引从0开始，所以从1开始）
          for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
            // 按列位置读取单元格（A=0, B=1, C=2...）
            const getCellValue = (col: number) => {
              const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: col })
              const cell = worksheet[cellAddress]
              return cell ? (cell.v !== undefined ? String(cell.v).trim() : '') : ''
            }
            
            const 编码 = getCellValue(1) // B列（索引1）
            
            // 只处理有编码的行
            if (编码) {
              const 数量 = parseFloat(getCellValue(6)) || 0
              const 不含税市场价 = parseFloat(getCellValue(8)) || 0 // I列（索引8）
              
              mappedData.push({
                序号: getCellValue(0) || (mappedData.length + 1), // A列
                编码: 编码,                                          // B列
                类别: getCellValue(2),                              // C列（类别在C列）
                名称: getCellValue(3),                              // D列
                规格型号: getCellValue(4),                          // E列
                单位: getCellValue(5),                              // F列
                数量: 数量,                                          // G列
                不含税市场价: 不含税市场价,                          // I列（索引8）
                税率: parseFloat(getCellValue(10)) || 0,            // K列（索引10）
                不含税市场价合计: parseFloat(getCellValue(11)) || 0 // L列（索引11）
              })
            }
          }
          
          resolve(mappedData)
        } catch (error) {
          console.error('Excel解析错误：', error)
          reject(new Error('Excel解析失败，请确认文件格式正确'))
        }
      }

      reader.onerror = () => {
        reject(new Error('文件读取失败'))
      }

      reader.readAsBinaryString(file)
    })
  }

  /**
   * 提取类别列表
   * @param data Excel数据
   * @returns 去重后的类别数组
   */
  const extractCategories = (data: ExcelRowData[]): string[] => {
    const categories = new Set<string>()
    data.forEach(item => {
      if (item.类别) {
        categories.add(item.类别)
      }
    })
    return Array.from(categories).sort()
  }

  /**
   * 导出为Excel文件
   * @param data 数据
   * @param filename 文件名
   */
  const exportToExcel = (data: any[], filename: string) => {
    try {
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
      
      const exportFilename = filename.endsWith('.xlsx') 
        ? filename 
        : `${filename}.xlsx`
      
      XLSX.writeFile(wb, exportFilename)
      
      return true
    } catch (error) {
      console.error('导出失败:', error)
      return false
    }
  }

  return {
    parseExcel,
    extractCategories,
    exportToExcel
  }
}

