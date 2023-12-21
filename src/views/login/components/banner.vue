<template>
  <div class="banner">
    <div class="banner-inner">
      <div class="carousel-item">
        <div class="carousel-title">{{ carouselItem[0].slogan }}</div>
        <div class="carousel-sub-title">{{ carouselItem[0].subSlogan }}</div>
        <img class="carousel-image" :src="carouselItem[0].image" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import bannerImage from '@/assets/images/login-banner.png'
  import LoginOrnament from '@/assets/images/loginOrnament.png'

  const { t } = useI18n()
  const carouselItem = computed(() => [
    {
      slogan: t('login.banner.slogan1'),
      subSlogan: t('login.banner.subSlogan1'),
      image: LoginOrnament
    },
    {
      slogan: t('login.banner.slogan2'),
      subSlogan: t('login.banner.subSlogan2'),
      image: bannerImage
    },
    {
      slogan: t('login.banner.slogan3'),
      subSlogan: t('login.banner.subSlogan3'),
      image: bannerImage
    }
  ])
</script>

<style lang="less" scoped>
  @import '@/styles/layout.less';
  @import '@/styles/theme.less';
  .banner {
    display: flex;
    align-items: center;
    justify-content: center;

    &-inner {
      flex: 1;
      height: 100%;
      #flex(row, center, center);
    }
  }

  .carousel {
    &-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 400px;
      height: 100%;
    }

    &-title {
      font-weight: 500;
      font-size: 20px;
      line-height: 28px;
      #color(color, --primary-text-color);
    }

    &-sub-title {
      margin-top: 8px;
      font-size: 14px;
      text-align: center;
      line-height: 22px;
      #color(color, --lighter-text-color);
    }

    &-image {
      width: 320px;
      margin-top: 30px;
    }
  }
</style>
