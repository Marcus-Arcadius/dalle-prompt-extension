<template>
<button type="button" class="
  inline-flex 
  items-center 
  px-2  
  py-1
  border 
  border-transparent 
  text-xs 
  font-medium 
  rounded 
  " :type="type" :class="class">
   <svg v-if="icon" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 pr-1.7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  <slot></slot>
</button>
</template>

<script>
export default {
  props:{
    icon: {
      type: String,
    }
  },
  computed: {
   
    class() {
      return `${this.class}`
    }
  },
}
</script>

<style>
  .btn-primary {
      @apply 
       text-white
       dark:text-black
       bg-black
       dark:bg-white
       hover:opacity-80
    }
    .btn-secondary{
      @apply
      text-white
      bg-red-500
      hover:bg-red-300
    }
</style>