<template>
  <div id="vcomments"></div>
</template>

<script>
export default {
  name: 'Valine',
  mounted: function(){
    // require window 
    const Valine = require('valine');
    if (typeof window !== 'undefined') {
      this.window = window
      window.AV = require('leancloud-storage')
      
    }
     
    new Valine({
      el: '#vcomments' ,
      appId: 'bVV42maft2Y2rLHrOYdhIjjB-gzGzoHsz',
      appKey: 'oirrJp7Gja2IuaJ2PbCRculk', 
      notify:false, 
      verify:false, 
      visitor: true,
      avatar:'mm', 
      placeholder: 'write here' 
    });
  },
}
</script>