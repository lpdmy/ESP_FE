import studentData from "../mock_data/student.json"

export const getStudentProfile = () => {
   return new Promise((resolve) => {
      setTimeout(() => {
         resolve(studentData)
      }, 500)
   })
}
