<template>
  <div>
    <div class="flex justify-between w-3xl mx-auto py-4">
      <h1>My App</h1>
      <ul class="nav flex gap-4">
        <li><NuxtLink to="/posts">Blog</NuxtLink></li>
        <li><NuxtLink to="/friend">Friend</NuxtLink></li>
        <ColorModeButton />
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup></script>

<style></style>
