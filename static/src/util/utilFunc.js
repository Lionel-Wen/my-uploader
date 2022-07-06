/**
 * 生成随机数
 * @returns
 */
export const createRandom = () => {
    let ran = Math.random() * new Date()
    return ran.toString(16).replace('.', '')
}