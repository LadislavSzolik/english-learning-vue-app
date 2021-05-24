const { createClient } = require('@supabase/supabase-js')
const supabaseUrl = 'https://yhdaxniklrzfxsjgpetf.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

exports.handler = async function (event, context) {
  try {
    let { data: topics, error } = await supabase
      .from('topics')
      .select(`id, name, topicwords(word)`)

    if (error) {
      throw new Error('Error happened during the supabase call: ' + error)
    }

    return {
      statusCode: 200,
      body: JSON.stringify(topics)
    }
  } catch (e) {
    console.log('Cannot call the topics table ' + e)
  }
  return {
    statusCode: 404,
    body: 'error'
  }
}
