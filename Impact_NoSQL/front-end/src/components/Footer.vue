<template>
  <div class="footer">
    <div class="github-sym">
      <a href="https://github.com/mason-spong/impact2">
        <img src="../assets/GitHub-Mark-32px.png" />
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: "Footer",
};
</script>

<style scoped>
.footer {
    padding-top: 50px;
    padding-bottom: 50px;
    background-color: #ce3d35;
}

.github-sym {
    width: fit-content;
    margin: 0 auto;
    padding: 20px;
    border-width: 2px;
    border-style: solid;
    border-color: whitesmoke;
}

.github-sym {
    width: fit-content;
    margin-left: auto;
    margin-right: auto;
}

.github-sym img {
    filter: invert(100%);
}
</style>
