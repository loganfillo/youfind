<template>
    
</template>

<script>
export default {
    name: "Component",

    props: {
        x : {
            type: String,
            required: true,
            default: "my component"
        }
    },

    data() {
        return {
            y: [1,2,3]
        }
    },

    methods: {

    }
}
</script>

<style lang="sass" scoped>

</style>


