// import {useFetch} from '@/composables/useFetch.js';

import { ref } from 'vue'
import { createSampleObjectList } from '@/helpers/dataClean'
import { useFetch } from '@vueuse/core'
const url = import.meta.env.VITE_API_BASE

let sampleFilePath = `test_samples?`
let sampleListPath = `samples_test_list`


export const getSampleFile = (BASE_URL, samplePack, file) => {
  let samplePackQuery = `?sample_pack=${samplePack}`
  const fileURL = ref(BASE_URL + samplePackQuery + file);
  return fileURL.value
}

export const getSampleData = async (BASE_URL, samplePack, file) => {
  const URL = ref(null)
  const result = ref(null)
  if (url !== BASE_URL) {
    console.log(BASE_URL)
    console.log(url)
    console.log('url is not base url')
  }
  
  let samplePackQuery = `?sample_pack=${samplePack}`
  
  

  if (file === 'list') {
    URL.value = BASE_URL + sampleListPath + samplePackQuery
    console.log(URL.value)
  } else {
    URL.value = url + sampleFilePath + samplePackQuery + file
    return URL.value
  }
//   if (type === 'file') {
//   URL.value = BASE_URL + sampleFilePath
// }

  try {
    // const { data, error } = useFetch(URL);
    const { data, isFetching, error } = await useFetch(URL).json()
    console.log('data.files')
    if (data || !isFetching) {
      result.value = createSampleObjectList(data)
      console.log('result.value')
      console.log(result.value)
      return result
    }
  } catch (error) {
    console.log('Error')
    console.log(error)
  }

  // if (data && !error) {

  //   console.log('result')
  //   console.log(result)
  //   return result.value
  // }
}

export default getSampleData
// let sample_list_url
// let sample_url
// // Check if the url contains a parameter to select a sample pack
// const urlParams = new URLSearchParams(window.location.search);
// if (urlParams.has("A")) {
// sample_list_url = Url + 'samples_test_list?sample_pack=a'
// sample_url = Url+'test_samples?sample_pack=a&file='
// }
// else if (urlParams.has("B")) {
// 	sample_list_url = Url + 'samples_test_list?sample_pack=b'
// 	sample_url = Url+'test_samples?sample_pack=b&file='
//   }
// else{
// sample_list_url = Url + 'samples_list'
// sample_url = Url+'samples?file='
// }
