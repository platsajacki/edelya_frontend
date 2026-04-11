<!-- Sort icon with directional arrow. Used in ShoppingPage list header -->
<template>
  <svg :width="width" :height="height" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_sort)">
      <!-- Decreasing lines -->
      <path d="M24 1C24 1.553 23.552 2 23 2H10C9.44803 2 9.00003 1.553 9.00003 1C9.00003 0.447 9.44803 0 10 0H23C23.552 0 24 0.447 24 1ZM20 5H10C9.44803 5 9.00003 5.447 9.00003 6C9.00003 6.553 9.44803 7 10 7H20C20.552 7 21 6.553 21 6C21 5.447 20.552 5 20 5ZM17 10H10C9.44803 10 9.00003 10.447 9.00003 11C9.00003 11.553 9.44803 12 10 12H17C17.552 12 18 11.553 18 11C18 10.447 17.552 10 17 10ZM14 15H10C9.44803 15 9.00003 15.447 9.00003 16C9.00003 16.553 9.44803 17 10 17H14C14.552 17 15 16.553 15 16C15 15.447 14.552 15 14 15Z" fill="currentColor"/>
      <!-- Arrow: flip vertically for ascending -->
      <g :transform="ascending ? 'translate(0,24) scale(1,-1)' : ''">
        <path d="M7.70703 19.293L6.00003 21V1C6.00003 0.447 5.55203 0 5.00003 0C4.44803 0 4.00003 0.447 4.00003 1V21L2.29203 19.292C1.90103 18.901 1.26903 18.901 0.878028 19.292C0.487028 19.683 0.487028 20.315 0.878028 20.706L3.58503 23.413C3.97503 23.803 4.48703 23.998 5.00003 23.998C5.51303 23.998 6.02403 23.803 6.41403 23.413L9.12103 20.706C9.51203 20.315 9.51203 19.683 9.12103 19.292C8.73003 18.901 8.09803 18.902 7.70703 19.293Z" fill="currentColor"/>
      </g>
    </g>
    <defs>
      <clipPath id="clip0_sort">
        <rect width="24" height="24" fill="white"/>
      </clipPath>
    </defs>
  </svg>
</template>

<script setup>
defineProps({
  width:     { default: 16 },
  height:    { default: 16 },
  ascending: { type: Boolean, default: true },
})
</script>
