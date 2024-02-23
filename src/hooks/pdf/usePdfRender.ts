import { ref, reactive, nextTick } from 'vue'
import * as PDFJS from 'pdfjs-dist/legacy/build/pdf'

PDFJS.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/legacy/build/pdf.worker.entry.js')

const usePdfRender = () => {
    // pdf实例
    const pdfCtx = ref<PDFJS.PDFDocumentProxy>()

    const PDFState = reactive({
        // 当前页
        currentPageNum: 0,
        // 总页数
        totalNumPage: 0,
        // 缩放比例
        scale: 1,
        // 缩放最小值 一倍
        minZoom: 10,
        // 缩放最大值 五倍
        maxZoom: 50
    })

    // pdf 预览容器
    const pdfCtxRef = ref<HTMLElement>()

    const renderPdf = (page = 1, callback?: () => void) => {
        if (!pdfCtx.value) return
        pdfCtx.value.getPage(page).then(page => {
            if (!pdfCtxRef.value) return
            const canvas = document.getElementById(`pdf-canvas-${page}`) as HTMLCanvasElement
            if (!canvas) return
            const ctx = canvas.getContext('2d')
            const viewport = page.getViewport({ scale: PDFState.scale })
            // 画布大小
            canvas.width = viewport.width
            canvas.height = viewport.height
            // 画布的dom大小, 设置移动端,宽度设置铺满整个屏幕
            const clientWidth = pdfCtxRef.value.clientWidth
            // const clientHeight = pdfRefCtx.value.clientHeight
            canvas.style.width = clientWidth + 'px' // clientHeight * (viewport.width / viewport.height) + 'px'
            // 根据pdf每页的宽高比例设置canvas的高度
            canvas.style.height = clientWidth * (viewport.height / viewport.width) + 'px' // pdfRefCtx.value.clientHeight// clientWidth * (viewport.height / viewport.width) + 'px'
            // 开始渲染
            if (!ctx) return
            page.render({
                canvasContext: ctx,
                viewport,
            })
            if (typeof callback === 'function') {
                callback()
            }
        })
    }

    const resolvePdf = (url: string, callback?: () => void) => {
        PDFJS.getDocument(url).promise.then(pdf => {
            pdfCtx.value = pdf
            PDFState.totalNumPage = pdf.numPages
            PDFState.currentPageNum = 1

            pdfCtx.value.getPage(1).then(res => {
                if (!pdfCtxRef.value) return
                const { width: wrapperWidth } = pdfCtxRef.value.getBoundingClientRect()
                const [x1, x2] = res._pageInfo.view
                const pageWidth = x2 - x1
                PDFState.scale = (wrapperWidth * (PDFState.maxZoom / 10)) / pageWidth
            })

            nextTick(() => {
                renderPdf(1, callback)
            })
        }).catch(err => {
            console.log(err)
        })
    }

    return {
        pdfCtxRef,
        PDFState,
        resolvePdf,
        renderPdf
    }
}

export default usePdfRender